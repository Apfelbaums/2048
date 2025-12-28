#!/usr/bin/env python3
"""
Тестовый скрипт для проверки API калькулятора майнинга Braiins
Документация: https://academy.braiins.com/en/mining-insights/public-api/#profitability-calculator

Этот скрипт отправляет запрос к API с тестовыми значениями для всех доступных полей
и выводит полученный ответ для анализа структуры данных.
"""

import requests
import json
import sys
from typing import Dict, Any

# URL API калькулятора профитабельности Braiins
API_URL = "https://insights.braiins.com/api/profitability-calculator"

def test_braiins_api() -> None:
    """
    Тестирует API калькулятора майнинга Braiins со всеми доступными параметрами
    """
    
    # Тестовые параметры с логичными значениями
    # Основываясь на документации API калькулятора майнинга
    test_params = {
        # Обязательные параметры
        "hashrate": 100,  # TH/s - хешрейт майнера
        "power": 3250,    # Watts - потребление электроэнергии
        "electricity_cost": 0.05,  # USD per kWh - стоимость электричества
        
        # Необязательные параметры
        "pool_fee": 2.5,          # % - комиссия пула (по умолчанию 2-3%)
        "btc_price": None,        # USD - цена BTC (если не указано, используется текущая)
        "network_difficulty": None, # - сложность сети (если не указано, используется текущая)
        "block_reward": None,     # BTC - награда за блок (если не указано, используется текущая)
        "duration": 30,           # days - период расчета (по умолчанию 30 дней)
        "currency": "USD",        # валюта для результатов
        
        # Дополнительные параметры (если поддерживаются)
        "miner_efficiency": None, # J/TH - эффективность майнера
        "maintenance_cost": 0,    # USD/day - расходы на обслуживание
        "hardware_cost": 0,       # USD - стоимость оборудования
        "initial_investment": 0,  # USD - начальные инвестиции
        
        # Параметры для advanced расчетов
        "include_fees": True,     # включать ли комиссии
        "compound_earnings": False, # реинвестирование доходов
    }
    
    print("🧪 Тестирование API калькулятора майнинга Braiins")
    print("=" * 60)
    print(f"API URL: {API_URL}")
    print()
    
    print("📤 Отправляемые параметры:")
    print(json.dumps(test_params, indent=2, ensure_ascii=False))
    print()
    
    try:
        # Отправляем POST запрос
        print("🚀 Отправка запроса...")
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mining-Calculator-Test/1.0'
        }
        
        # Очищаем параметры от None значений
        clean_params = {k: v for k, v in test_params.items() if v is not None}
        
        response = requests.post(
            API_URL,
            json=clean_params,
            headers=headers,
            timeout=30
        )
        
        print(f"📊 Статус ответа: {response.status_code}")
        print(f"📊 Headers ответа: {dict(response.headers)}")
        print()
        
        if response.status_code == 200:
            print("✅ Успешный ответ!")
            result = response.json()
            print("📋 Полученные данные:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            # Анализируем структуру ответа
            print("\n🔍 Анализ структуры ответа:")
            analyze_response_structure(result)
            
        else:
            print("❌ Ошибка запроса!")
            print(f"Код ошибки: {response.status_code}")
            print(f"Текст ошибки: {response.text}")
            
            # Попробуем парсить как JSON даже в случае ошибки
            try:
                error_data = response.json()
                print("📋 Данные ошибки (JSON):")
                print(json.dumps(error_data, indent=2, ensure_ascii=False))
            except:
                print("📋 Ответ не является JSON")
    
    except requests.exceptions.RequestException as e:
        print(f"🚫 Ошибка соединения: {e}")
        print("\n💡 Возможные причины:")
        print("- Проблемы с интернет-соединением")
        print("- API временно недоступен")
        print("- Неверный URL API")
        
    except Exception as e:
        print(f"🚫 Неожиданная ошибка: {e}")

def analyze_response_structure(data: Dict[str, Any], prefix: str = "") -> None:
    """
    Анализирует и выводит структуру ответа API
    """
    for key, value in data.items():
        current_path = f"{prefix}.{key}" if prefix else key
        
        if isinstance(value, dict):
            print(f"  📁 {current_path}: dict ({len(value)} keys)")
            analyze_response_structure(value, current_path)
        elif isinstance(value, list):
            print(f"  📋 {current_path}: list ({len(value)} items)")
            if value and isinstance(value[0], dict):
                print(f"      └─ Первый элемент:")
                analyze_response_structure(value[0], f"{current_path}[0]")
        else:
            value_type = type(value).__name__
            print(f"  📝 {current_path}: {value_type} = {value}")

def test_alternative_endpoints() -> None:
    """
    Тестирует альтернативные эндпоинты API, если основной не работает
    """
    alternative_urls = [
        "https://insights.braiins.com/api/profitability-calculator",
        "https://insights.braiins.com/api/v1/profitability-calculator",
        "https://insights.braiins.com/api/v2/profitability-calculator"
    ]
    
    print("\n🔄 Тестирование альтернативных URL...")
    
    for url in alternative_urls:
        print(f"\n🌐 Пробую: {url}")
        try:
            response = requests.get(url, timeout=10)
            print(f"   Статус: {response.status_code}")
            if response.status_code != 404:
                print(f"   Ответ: {response.text[:200]}...")
        except Exception as e:
            print(f"   Ошибка: {e}")

if __name__ == "__main__":
    test_braiins_api()
    test_alternative_endpoints()
    
    print("\n" + "=" * 60)
    print("🎯 Следующие шаги:")
    print("1. Изучить документацию API если запрос не прошел")
    print("2. Проверить правильность параметров")
    print("3. Адаптировать структуру запроса под реальный API")
    print("4. Создать рабочий интерфейс калькулятора")
