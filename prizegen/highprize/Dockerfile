FROM python
COPY . .
RUN pip install flask
RUN pip install requests
EXPOSE 9017
ENTRYPOINT ["python", "app.py"]
