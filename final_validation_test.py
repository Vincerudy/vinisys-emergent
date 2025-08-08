#!/usr/bin/env python3
"""
PHASE FINALE - VALIDATION BACKENDS CORRIGÉS
Test final des APIs après correction des erreurs SQL
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL configuration
BASE_URL = "http://localhost:8001"
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_EMAIL = "demo@demo.com"
TEST_PASSWORD = "123456"
TEST_SOCIETE_ID = 2

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")

def print_test_result(success, message, response=None):
    """Print formatted test result"""
    status = "✅ PASSED" if success else "❌ FAILED"
    print(f"{status}: {message}")
    if response and hasattr(response, 'status_code'):
        print(f"Status Code: {response.status_code}")
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            except:
                print(f"Response Text: {response.text}")
        else:
            print(f"Response Text: {response.text}")
    print("-" * 60)

def test_authentication():
    """Test authentication to get user data"""
    print_test_header("Authentication Test")
    
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{API_BASE}/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "id" in data:
                print_test_result(True, f"Authentication successful for user: {data.get('email', 'N/A')}")
                return True, data
            else:
                print_test_result(False, "Authentication response missing required fields", response)
                return False, None
        else:
            print_test_result(False, f"Authentication failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Authentication test failed - {str(e)}")
        return False, None

def test_notes_frais_dashboard(user_data):
    """Test Notes de frais Dashboard - Should now work without SQL errors"""
    print_test_header("Notes de frais Dashboard Test (POST-CORRECTION)")
    
    if not user_data or 'societe_id' not in user_data:
        print_test_result(False, "No company data available")
        return False
    
    societe_id = user_data['societe_id']
    
    try:
        response = requests.get(f"{API_BASE}/notes-frais/dashboard/{societe_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["periode", "indicateurs", "utilisateurs", "types_frais", "evolution", "statuts", "kilometriques"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test_result(True, f"Notes de frais dashboard working - Company ID: {societe_id}")
                return True, data
            else:
                print_test_result(False, f"Notes de frais dashboard missing fields: {missing_fields}", response)
                return False, None
        else:
            print_test_result(False, f"Notes de frais dashboard failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Notes de frais dashboard test failed - {str(e)}")
        return False, None

def test_achats_dashboard(user_data):
    """Test Achats Dashboard - Verify it still works"""
    print_test_header("Achats Dashboard Test (VERIFICATION)")
    
    if not user_data or 'societe_id' not in user_data:
        print_test_result(False, "No company data available")
        return False
    
    societe_id = user_data['societe_id']
    
    try:
        response = requests.get(f"{API_BASE}/achats/dashboard/{societe_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["periode", "indicateurs", "categories", "fournisseurs", "evolution", "validation", "statuts", "paiements"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test_result(True, f"Achats dashboard working - Company ID: {societe_id}")
                return True, data
            else:
                print_test_result(False, f"Achats dashboard missing fields: {missing_fields}", response)
                return False, None
        else:
            print_test_result(False, f"Achats dashboard failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Achats dashboard test failed - {str(e)}")
        return False, None

def test_essential_endpoints(user_data):
    """Test essential endpoints"""
    print_test_header("Essential Endpoints Test")
    
    if not user_data or 'societe_id' not in user_data:
        print_test_result(False, "No company data available")
        return False
    
    societe_id = user_data['societe_id']
    results = {}
    
    # Test types-frais
    try:
        response = requests.get(f"{API_BASE}/types-frais/{societe_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "types" in data:
                results["types-frais"] = True
                print(f"  ✅ Types de frais: {len(data['types'])} types found")
            else:
                results["types-frais"] = False
                print(f"  ❌ Types de frais: Missing 'types' field")
        else:
            results["types-frais"] = False
            print(f"  ❌ Types de frais: HTTP {response.status_code}")
    except Exception as e:
        results["types-frais"] = False
        print(f"  ❌ Types de frais: {str(e)}")
    
    # Test categories-achats
    try:
        response = requests.get(f"{API_BASE}/categories-achats/{societe_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "categories" in data:
                results["categories-achats"] = True
                print(f"  ✅ Catégories achats: {len(data['categories'])} categories found")
            else:
                results["categories-achats"] = False
                print(f"  ❌ Catégories achats: Missing 'categories' field")
        else:
            results["categories-achats"] = False
            print(f"  ❌ Catégories achats: HTTP {response.status_code}")
    except Exception as e:
        results["categories-achats"] = False
        print(f"  ❌ Catégories achats: {str(e)}")
    
    success_count = sum(results.values())
    total_count = len(results)
    
    if success_count == total_count:
        print_test_result(True, f"All essential endpoints working ({success_count}/{total_count})")
        return True, results
    else:
        print_test_result(False, f"Some essential endpoints failed ({success_count}/{total_count})")
        return False, results

def main():
    """Main test execution for final validation"""
    print("🚀 PHASE FINALE - VALIDATION BACKENDS CORRIGÉS")
    print("📊 Test final des APIs après correction des erreurs SQL")
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = []
    
    # Test 1: Authentication
    auth_success, user_data = test_authentication()
    test_results.append(("Authentication", auth_success))
    
    if not auth_success or not user_data:
        print("\n❌ Authentication failed. Cannot proceed with tests.")
        return False
    
    # Test 2: Notes de frais Dashboard (main focus - should be fixed)
    notes_success, notes_data = test_notes_frais_dashboard(user_data)
    test_results.append(("Notes de frais Dashboard", notes_success))
    
    # Test 3: Achats Dashboard (verify still works)
    achats_success, achats_data = test_achats_dashboard(user_data)
    test_results.append(("Achats Dashboard", achats_success))
    
    # Test 4: Essential endpoints
    endpoints_success, endpoints_data = test_essential_endpoints(user_data)
    test_results.append(("Essential Endpoints", endpoints_success))
    
    # Print summary
    print(f"\n{'='*60}")
    print("FINAL VALIDATION SUMMARY")
    print(f"{'='*60}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    # Final assessment
    print(f"\n{'='*60}")
    print("VALIDATION COMPLÈTE")
    print(f"{'='*60}")
    
    if notes_success:
        print("✅ Notes de frais Dashboard: ERREURS SQL CORRIGÉES")
    else:
        print("❌ Notes de frais Dashboard: ERREURS SQL PERSISTENT")
        
    if achats_success:
        print("✅ Achats Dashboard: TOUJOURS FONCTIONNEL")
    else:
        print("❌ Achats Dashboard: PROBLÈME DÉTECTÉ")
        
    if endpoints_success:
        print("✅ Endpoints essentiels: OPÉRATIONNELS")
    else:
        print("❌ Endpoints essentiels: PROBLÈMES DÉTECTÉS")
    
    if passed == total:
        print("\n🎉 VALIDATION RÉUSSIE: Toutes les erreurs SQL ont été corrigées!")
        print("🎉 Les deux modules backend sont 100% opérationnels!")
        return True
    else:
        print(f"\n⚠️  VALIDATION PARTIELLE: {passed}/{total} tests réussis")
        print("   Des corrections supplémentaires sont nécessaires.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)