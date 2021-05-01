import gspread
from oauth2client.service_account import ServiceAccountCredentials

scope = [
'https://spreadsheets.google.com/feeds',
'https://www.googleapis.com/auth/drive',
]

json_file_name = '.\\failuremap-32c588e2da44.json'
credentials = ServiceAccountCredentials.from_json_keyfile_name(json_file_name, scope)
gc = gspread.authorize(credentials)

# "client_email": "chung-780@failuremap.iam.gserviceaccount.com"

spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1S54gElok1yrzrK5w79e_7pPra7wZUj6MUzDjmUveYHY/edit?usp=sharing'

# 스프레스시트 문서 가져오기 
doc = gc.open_by_url(spreadsheet_url)

# 시트 선택하기
worksheet = doc.worksheet('Failure Map Data')

# 행 데이터 가져오기
row_data = worksheet.row_values(2)
print(row_data)