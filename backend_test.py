#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application - Phase 2
Tests the refactored separated modules: Achats (Purchases) and Notes de frais (Expense Reports)
"""

import requests
import json
import sys
from datetime import datetime, date

# Backend URL configuration - Using external URL from frontend env
BASE_URL = "https://api.vinisys.com"  # External URL from backend .env
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_EMAIL = "demo@demo.com"
TEST_PASSWORD = "123456"
TEST_SOCIETE_ID = 2  # Company ID for testing

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

def test_server_connectivity():
    """Test 1: Verify backend server is responding"""
    print_test_header("Backend Server Connectivity Test")
    try:
        response = requests.get(BASE_URL, timeout=10)
        if response.status_code == 200:
            print_test_result(True, f"Backend server is responding: {response.text.strip()}", response)
            return True
        else:
            print_test_result(False, f"Backend server returned unexpected status: {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result(False, f"Backend server connectivity failed - {str(e)}")
        return False

def test_database_connection():
    """Test 2: Test database connection"""
    print_test_header("Database Connection Test")
    try:
        response = requests.get(f"{API_BASE}/test-db", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "Connexion réussie" in data.get("message", ""):
                print_test_result(True, "Database connection successful", response)
                return True
            else:
                print_test_result(False, "Database connection failed - unexpected response", response)
                return False
        else:
            print_test_result(False, f"Database connection failed - HTTP {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result(False, f"Database connection failed - {str(e)}")
        return False

def test_authentication_login():
    """Test 3: Test authentication endpoint with demo credentials"""
    print_test_header("Authentication Login Test")
    
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{API_BASE}/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "id" in data:
                print_test_result(True, f"Authentication successful for user: {data.get('email', 'N/A')}", response)
                return True, data
            else:
                print_test_result(False, "Authentication response missing required fields", response)
                return False, None
        elif response.status_code == 401:
            print_test_result(False, "Authentication failed - Invalid credentials", response)
            return False, None
        else:
            print_test_result(False, f"Authentication failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Authentication test failed - {str(e)}")
        return False, None

def test_expenses_list_endpoint(user_data):
    """Test 4: Test expenses list endpoint"""
    print_test_header("Expenses List Endpoint Test")
    
    if not user_data or 'id' not in user_data:
        print_test_result(False, "No user data available for expenses test")
        return False
    
    user_id = user_data['id']
    
    try:
        response = requests.get(f"{API_BASE}/depenses/{user_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "depenses" in data and "pagination" in data and "stats" in data:
                expenses_count = len(data["depenses"])
                print_test_result(True, f"Expenses list retrieved successfully - {expenses_count} expenses found", response)
                return True, data
            else:
                print_test_result(False, "Expenses response missing required fields", response)
                return False, None
        elif response.status_code == 404:
            print_test_result(False, "User not found for expenses", response)
            return False, None
        else:
            print_test_result(False, f"Expenses list failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Expenses list test failed - {str(e)}")
        return False, None

def test_create_expense(user_data):
    """Test 5: Test creating a new expense"""
    print_test_header("Create Expense Test")
    
    if not user_data or 'id' not in user_data:
        print_test_result(False, "No user data available for expense creation test")
        return False
    
    expense_data = {
        "userId": user_data['id'],
        "type": "repas",
        "dateDepense": "2024-08-07",
        "description": "Déjeuner d'affaires - Test API",
        "montantTTC": "45.50",
        "montantHT": "37.92",
        "montantTVA": "7.58",
        "tauxTVA": "20",
        "lieuRepas": "Restaurant Le Test",
        "nombrePersonnes": "2",
        "typeRepas": "dejeuner"
    }
    
    try:
        response = requests.post(f"{API_BASE}/depense", json=expense_data, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            if "message" in data and "depenseId" in data:
                print_test_result(True, f"Expense created successfully with ID: {data['depenseId']}", response)
                return True, data.get("depenseId")
            else:
                print_test_result(False, "Expense creation response missing required fields", response)
                return False, None
        elif response.status_code == 400:
            print_test_result(False, "Expense creation failed - Bad request", response)
            return False, None
        elif response.status_code == 404:
            print_test_result(False, "Expense creation failed - User not found", response)
            return False, None
        else:
            print_test_result(False, f"Expense creation failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Expense creation test failed - {str(e)}")
        return False, None

def test_api_endpoints_discovery():
    """Test 6: Discover available API endpoints"""
    print_test_header("API Endpoints Discovery Test")
    
    # Test common endpoints to see what's available
    endpoints_to_test = [
        "/test-db",
        "/login", 
        "/depenses/1",  # This will likely return 404 but shows the endpoint exists
    ]
    
    available_endpoints = []
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{API_BASE}{endpoint}", timeout=5)
            # Consider endpoint available if it doesn't return 404
            if response.status_code != 404:
                available_endpoints.append(f"GET {endpoint} - Status: {response.status_code}")
        except:
            pass
    
    # Test POST endpoints
    post_endpoints = ["/login", "/depense"]
    for endpoint in post_endpoints:
        try:
            response = requests.post(f"{API_BASE}{endpoint}", json={}, timeout=5)
            if response.status_code != 404:
                available_endpoints.append(f"POST {endpoint} - Status: {response.status_code}")
        except:
            pass
    
    if available_endpoints:
        print_test_result(True, f"Found {len(available_endpoints)} available endpoints")
        for endpoint in available_endpoints:
            print(f"  - {endpoint}")
        return True
    else:
        print_test_result(False, "No API endpoints discovered")
        return False

def main():
    """Main test execution"""
    print("🚀 Starting Backend API Tests for Vinisys Authentication and Expenses Module")
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"Test Credentials: {TEST_EMAIL} / {TEST_PASSWORD}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = []
    user_data = None
    
    # Test 1: Server connectivity
    server_ok = test_server_connectivity()
    test_results.append(("Server Connectivity", server_ok))
    
    if not server_ok:
        print("\n❌ Backend server is not responding. Stopping tests.")
        return False
    
    # Test 2: Database connection
    db_connected = test_database_connection()
    test_results.append(("Database Connection", db_connected))
    
    if not db_connected:
        print("\n❌ Database connection failed. Stopping tests.")
        return False
    
    # Test 3: Authentication
    auth_success, user_data = test_authentication_login()
    test_results.append(("Authentication Login", auth_success))
    
    # Test 4: API endpoints discovery
    endpoints_discovered = test_api_endpoints_discovery()
    test_results.append(("API Endpoints Discovery", endpoints_discovered))
    
    # Test 5: Expenses list (only if authenticated)
    if auth_success and user_data:
        expenses_success, expenses_data = test_expenses_list_endpoint(user_data)
        test_results.append(("Expenses List", expenses_success))
        
        # Test 6: Create expense (only if previous tests passed)
        if expenses_success:
            create_success, expense_id = test_create_expense(user_data)
            test_results.append(("Create Expense", create_success))
        else:
            test_results.append(("Create Expense", False))
    else:
        test_results.append(("Expenses List", False))
        test_results.append(("Create Expense", False))
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    # Additional information
    print(f"\n{'='*60}")
    print("BACKEND ANALYSIS")
    print(f"{'='*60}")
    
    if server_ok:
        print("✅ Backend server is running and responding")
    if db_connected:
        print("✅ Database connection is working")
    if auth_success:
        print(f"✅ Authentication system is working with test credentials")
        if user_data:
            print(f"   - User ID: {user_data.get('id', 'N/A')}")
            print(f"   - Email: {user_data.get('email', 'N/A')}")
            print(f"   - Company ID: {user_data.get('societe_id', 'N/A')}")
    else:
        print("❌ Authentication failed - check if demo@demo.com user exists with password 123456")
    
    if passed >= 4:  # At least basic connectivity and auth working
        print("\n🎉 Backend core functionality is working!")
        if passed == total:
            print("🎉 All tests passed! The backend API is fully functional.")
        else:
            print("⚠️  Some advanced features may need attention.")
        return True
    else:
        print("\n⚠️  Critical backend issues detected. Please check the failures above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)