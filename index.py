import os, sys, datetime
from flask import request, jsonify, render_template, redirect, url_for, session
from flask_pymongo import pymongo
from bson.objectid import ObjectId
from setup import db, app
from werkzeug.exceptions import NotFound
from functools import wraps
from flask_bcrypt import Bcrypt
import html
from cerberus import Validator
from http import HTTPStatus

app.secret_key = f'{os.environ.get("SECLET_KEY")}'.encode()
bcrypt = Bcrypt(app)
account_schema = {
  'email': {
     'type': 'string',
     'regex': '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
  },
  'password': {
    'type': 'string',
    'minlength': 4,
    'maxlength': 12,
  }
}
task_schema = {
  'task': {
    'type': 'string',
    'minlength': 0,
    'maxlength': 200,
    'required': True
  }
}
task_detail_schema = {
  'text': {
    'type': 'string',
  },
  'status': {
    'type': 'string',
    'regex': r'^[0-9]$'
  },
  'project_id': {
    'type': 'string',
    'regex': r'^[0-9a-zA-Z]*$'
  },
  'start_datetime': {
    'type': 'string',
    'regex': r'|^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$' #空文字または日時にマッチ
  },
  'end_datetime': {
    'type': 'string',
    'regex': r'|^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$'
  },
  'progress_rate': {
    'type': 'string',
    'regex': r'^[0-9]{0,3}$'
  },
}
project_schema = {
  'name': {
    'type': 'string',
    'minlength': 0,
    'maxlength': 50,
    'required': True
  }
}

def login_required(f):
    @wraps(f)
    def decorated_view(*args, **kwargs):
        if "account_id" not in session or not session["account_id"]:
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_view

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/',methods=["POST"])
def login():
    data = request.form
    if (not data['email'] or not data['password']):
        message = 'emailまたはpasswordを入力してください'
    try:
        account = db.account.find_one_or_404( { 'email': data['email']  } )
        app.logger.info(account)
        if (not bcrypt.check_password_hash(account['password'], data['password'])):
            raise NotFound
        app.logger.info('password is %s', account['password'])
        session['account_id'] = str(account['_id'])
        return redirect(url_for('tasks'))
    except NotFound as err:
        app.logger.info(err)
        message = 'emailまたはpasswordをご確認ください'
        return render_template('login.html', message=message, alert_type="alert-danger")
    except Exception as err:
        app.logger.info(err)
        message = 'ログイン処理に失敗しました。'
        return render_template('login.html', message=message, alert_type="alert-danger")

@app.route('/logout')
def logout():
    session.pop('account_id', None)
    return redirect(url_for('index'))

@app.route('/account/new')
def account():
    return render_template('create-account.html')

@app.route('/account/new',methods=["POST"])
def create_account():
    data = request.form
    if (not data['email'] or not data['password']):
        message = 'emailまたはpasswordを入力してください'
    else:
        result = validation_check(account_schema, data)
        if ('status_code' in result and result['status_code'] is 422):
            app.logger.info('message is %s', result['message'])
            message_array = []
            for key in result['message']:
                for error in result['message'][key]:
                    app.logger.info('key is %s', key)
                    message_array.append(key + ': ' + error)

            return  render_template(
                'create-account.html',
                messages=message_array,
                alert_type=result['alert_type']
            ), result['status_code']

        pw_hash = bcrypt.generate_password_hash(data['password'])
        app.logger.info('password is %s', pw_hash)
        status_code = HTTPStatus.CREATED
        item = {
            'email': data['email'],
            'password': pw_hash
        }
        try:
            db.account.insert_one(item)
            message = 'アカウントを作成しました。'
            alert_type = 'alert-success'
        except pymongo.errors.DuplicateKeyError as err:
            app.logger.info(err)
            message = 'メールアドレスが既に登録済みです。'
            alert_type = 'alert-danger'
            status_code = HTTPStatus.CONFLICT
        except Exception as err:
            app.logger.info(err)
            message = 'アカウントの作成に失敗しました。'
            alert_type = 'alert-danger'
            status_code = HTTPStatus.INTERNAL_SERVER_ERROR

    return render_template('create-account.html', message=message, alert_type=alert_type), status_code

@app.route('/tasks')
@login_required
def tasks():
    return render_template('task-manager.html')

@app.route('/todo')
@login_required
def get_todo():
    status_code = HTTPStatus.OK
    message = ''
    alert_type = ''
    data = []
    try:
        search_data = request.args
        page_size = int(search_data['page_size'])
        index = int(search_data['index'])
        status = int(search_data['status'])
        project_id = str(search_data['project_id'])
        _todos = db.todo.find(
                    {
                        'account_id': session['account_id'],
                        'status': status,
                        'project_id': {'$in': ['', project_id]},
                    }).sort('_id', -1).skip(page_size * index).limit(page_size)
        item = {}
        for todo in _todos:
            item = {
                'id': str(todo['_id']),
                'todo': html.escape(todo['todo']),
            }
            data.append(item)
    except Exception as err:
            app.logger.info(err)
            message = 'リストの取得に失敗しました。'
            alert_type = 'alert-danger'
            status_code = HTTPStatus.INTERNAL_SERVER_ERROR

    return jsonify(
        data=data,
        message=message,
        alert_type=alert_type,
    ), status_code

@app.route('/todo/new', methods=['POST'])
@login_required
def create_todo():
    data = request.form
    message=''
    alert_type=''
    status_code = HTTPStatus.CREATED
    item={}
    if (not data['task']):
        message='TODOを入力してください。'
    else:
        # result = validation_check(task_schema, 'name', data['task'])
        result = validation_check(task_schema, data)
        if ('status_code' in result and result['status_code'] is HTTPStatus.UNPROCESSABLE_ENTITY):
            return jsonify(
                message=result['message'],
                alert_type=result['alert_type'],
            ), result['status_code']

        try:
            item = {
                'todo': data['task'],
                'detail': '',
                'account_id': session['account_id'],
                'status': 0,
                'project_id': '',
                'start_datetime': '',
                'end_datetime': '',
                'progress_rate': 0,
                'last_modified': datetime.datetime.utcnow(),
            }
            res = db.todo.insert_one(item)
            data = {
                'id': str(res.inserted_id),
                'todo': html.escape(item['todo']),
                'detail': item['detail'],
            }
            alert_type = 'alert-success'
        except Exception as err:
            app.logger.info(err)
            message = html.escape(err)
            alert_type = 'alert-danger'
            status_code = HTTPStatus.INTERNAL_SERVER_ERROR

    #TODO 失敗時の処理も入れる
    return jsonify(
        message=message,
        data=data,
        alert_type=alert_type
    ), status_code

@app.route('/todo/<todo_id>/detail')
@login_required
def get_todo_detail(todo_id):
    status_code = HTTPStatus.OK
    message = ''
    alert_type = ''
    item = {}
    try:
        todo = db.todo.find_one_or_404({"_id": ObjectId(todo_id)})

        item = {
                'id': str(todo['_id']),
                'detail': html.escape(todo['detail']),
                'status': todo['status'],
                'start_datetime': todo['start_datetime'],
                'end_datetime': todo['end_datetime'],
                'progress_rate': todo['progress_rate'],
                'project_id': todo['project_id'],
            }
    except Exception as err:
            app.logger.info(err)
            message = '詳細の取得に失敗しました。'
            alert_type = 'alert-danger'
            status_code = HTTPStatus.INTERNAL_SERVER_ERROR

    return jsonify(
        data=item,
        message=message,
        alert_type=alert_type,
    ), status_code

@app.route('/todo/<todo_id>/detail/update', methods=['POST'])
@login_required
def update_todo_detail(todo_id):
    data = request.form
    message=''
    status_code = HTTPStatus.OK
    alert_type=''
    app.logger.info('request.form is %s',  request.form)
    app.logger.info('text is %s',  data['text'])
    try:
        # result = validation_check(task_detail_schema, 'name', data['name'])
        result = validation_check(task_detail_schema, data)
        if ('status_code' in result and result['status_code'] is HTTPStatus.UNPROCESSABLE_ENTITY):
            return jsonify(
                message=result['message'],
                alert_type=result['alert_type'],
            ), result['status_code']

        result = db.todo.update_one(
                    {'_id': ObjectId(todo_id)},
                    {
                        '$set': 
                        {
                            'detail': data['text'],
                            'status': int(data['status']),
                            'project_id': data['project_id'],
                            'start_datetime': data['start_datetime'],
                            'end_datetime': data['end_datetime'],
                            'progress_rate': data['progress_rate'],
                            'last_modified': datetime.datetime.utcnow(),
                        }
                    })
        message='更新しました。'
        alert_type='alert-success'
    except Exception as err:
        app.logger.info(err)
        message = html.escape(err)
        alert_type = 'alert-danger'
        status_code=HTTPStatus.INTERNAL_SERVER_ERROR
    # app.logger.info('todo detail update result %s', result)

    return jsonify(
        message=message,
        alert_type=alert_type
    ), status_code

@app.route('/project/new', methods=['POST'])
@login_required
def create_project():
    data = request.form
    message=''
    status_code = HTTPStatus.CREATED
    alert_type=''
    item={}
    if (not data['name']):
        message='Project Nameを入力してください。'
    else:
        result = validation_check(project_schema, data)
        if ('status_code' in result and result['status_code'] is HTTPStatus.UNPROCESSABLE_ENTITY):
            return jsonify(
                message=result['message'],
                alert_type=result['alert_type'],
            ), result['status_code']
        try:
            item = {
                'name': data['name'],
                'account_id': session['account_id'],
            }
            res = db.project.insert_one(item)
            data = {
                'id': str(res.inserted_id),
                'name': html.escape(item['name']),
            }
        except Exception as err:
            app.logger.info(err)
            message = html.escape(err)
            alert_type = 'alert-danger'

    return jsonify(
        message=message,
        data=data,
        alert_type=alert_type
    ), status_code


@app.route('/project')
@login_required
def get_project():
    status_code = HTTPStatus.OK
    message = ''
    alert_type = ''
    data = []
    try:
        _projects = db.project.find({'account_id': session['account_id']})
        item = {}
        for project in _projects:
            item = {
                'id': str(project['_id']),
                'name': html.escape(project['name']),
            }
            data.append(item)
    except Exception as err:
            app.logger.info(err)
            message = 'projectの取得に失敗しました。'
            alert_type = 'alert-danger'
            status_code = HTTPStatus.INTERNAL_SERVER_ERROR

    return jsonify(
        data=data,
        message=message,
        alert_type=alert_type,
    ), status_code

def validation_check(schema, data):
    v = Validator(schema)
    result = {
        'status_code': None,
        'message': '',
        'alert_type': ''
    }
    if (v.validate(data) is False):
        app.logger.info(v.errors)
        result['status_code'] = HTTPStatus.UNPROCESSABLE_ENTITY
        result['message'] = html.escape(v.errors)
        result['alert_type'] = 'alert-danger'

    return result
    
if __name__ == "__main__":
    ENVIRONMENT_DEBUG = os.environ.get("APP_DEBUG", True)
    ENVIRONMENT_PORT = os.environ.get("APP_PORT", 5000)
    app.run(host='0.0.0.0', port=ENVIRONMENT_PORT, debug=ENVIRONMENT_DEBUG)