import requests

base_url = "https://insights.braiins.com/api/profitability-calculator"

params = {
    "hashrate": 100,
    "power": 3250,
    "electricity_cost": 0.05,
    "duration": 30,
    "pool_fee": 2.5,
    "btc_price": 50000,
    "currency": "USD"
}

response = requests.get(base_url, params=params)
print("URL:", response.url)
print("Status code:", response.status_code)
print("Response:")
try:
    print(response.json())
except Exception:
    print(response.text)

