FROM python:3.9-alpine
ADD . /code
WORKDIR /code
RUN apk add build-base libffi-dev && pip install -r requirements.txt
CMD ["python", "index.py"]