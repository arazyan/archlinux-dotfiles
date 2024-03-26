import requests

link = "https://icanhazip.com/"

# get - получить данные со страницы
# post - авторизация, требуется передать данные на страницу

# перезагрузка страницы аналогична запросу get()
response = requests.get(link)
print(response.text)
print(response.status_code)
print(response.headers)
