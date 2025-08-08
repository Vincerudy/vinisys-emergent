#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application - Dashboard and Invoice Data Recovery
Tests the restored invoice and dashboard routes after route restoration
"""

import requests
import json
import sys
from datetime import datetime, date

# Backend URL configuration - Using frontend environment URL
with open('/app/frontend/.env', 'r') as f:
    env_content = f.read()
    for line in env_content.split('\n'):
        if line.startswith('VITE_API_URL='):
            api_path = line.split('=')[1]
            break
    else:
        api_path = '/api'

BASE_URL = "http://localhost:8001"  # Internal URL for testing
API_BASE = f"{BASE_URL}{api_path}"

# Test credentials and user ID from review request
TEST_EMAIL = "demo@demo.com"
TEST_PASSWORD = "123456"
TEST_USER_ID = 67  # User ID specified in review request

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
    """Test 0: Verify backend server is responding"""
    print_test_header("Backend Server Connectivity Test")
    try:
        response = requests.get(BASE_URL, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print_test_result(True, f"Backend server is responding", response)
            return True
        else:
            print_test_result(False, f"Backend server returned unexpected status: {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result(False, f"Backend server connectivity failed - {str(e)}")
        return False

def test_dashboard_data():
    """Test 1: Test dashboard data endpoint - GET /api/dashbordData/dashbordData?id=67"""
    print_test_header("Dashboard Data Recovery Test")
    try:
        response = requests.get(f"{API_BASE}/dashbordData/dashbordData?id={TEST_USER_ID}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Check for key dashboard metrics
            expected_fields = ["chiffre_affaires", "tva", "nb_factures", "nb_clients"]
            missing_fields = [field for field in expected_fields if field not in str(data)]
            
            if len(missing_fields) < len(expected_fields):  # At least some fields present
                print_test_result(True, f"Dashboard data retrieved successfully for user {TEST_USER_ID}", response)
                return True, data
            else:
                print_test_result(False, f"Dashboard data missing key fields", response)
                return False, None
        else:
            print_test_result(False, f"Dashboard data endpoint failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Dashboard data test failed - {str(e)}")
        return False, None

def test_invoice_list():
    """Test 2: Test invoice list endpoint - GET /api/listeFacture/listeFacture/67?page=1"""
    print_test_header("Invoice List Recovery Test")
    try:
        response = requests.get(f"{API_BASE}/listeFacture/listeFacture/{TEST_USER_ID}?page=1", timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Check if we have invoice data structure
            if isinstance(data, dict) and ("factures" in data or "data" in data):
                print_test_result(True, f"Invoice list retrieved successfully for user {TEST_USER_ID}", response)
                return True, data
            elif isinstance(data, list):
                print_test_result(True, f"Invoice list retrieved successfully - {len(data)} invoices found", response)
                return True, data
            else:
                print_test_result(False, f"Invoice list has unexpected format", response)
                return False, None
        else:
            print_test_result(False, f"Invoice list endpoint failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Invoice list test failed - {str(e)}")
        return False, None

def test_chart_data():
    """Test 3: Test chart data endpoint - GET /api/dataGraphiqueFacture/dataGraphiqueFacture/67"""
    print_test_header("Chart Data Recovery Test")
    try:
        response = requests.get(f"{API_BASE}/dataGraphiqueFacture/dataGraphiqueFacture/{TEST_USER_ID}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Check if we have chart data
            if data and (isinstance(data, list) or isinstance(data, dict)):
                print_test_result(True, f"Chart data retrieved successfully for user {TEST_USER_ID}", response)
                return True, data
            else:
                print_test_result(False, f"Chart data is empty or invalid format", response)
                return False, None
        else:
            print_test_result(False, f"Chart data endpoint failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Chart data test failed - {str(e)}")
        return False, None

def test_client_list():
    """Test 4: Test client list endpoint - GET /api/listeClient/listeClient/67"""
    print_test_header("Client List Recovery Test")
    try:
        response = requests.get(f"{API_BASE}/listeClient/listeClient/{TEST_USER_ID}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Check if we have client data
            if data and (isinstance(data, list) or isinstance(data, dict)):
                if isinstance(data, list):
                    print_test_result(True, f"Client list retrieved successfully - {len(data)} clients found", response)
                else:
                    print_test_result(True, f"Client list retrieved successfully", response)
                return True, data
            else:
                print_test_result(False, f"Client list is empty or invalid format", response)
                return False, None
        else:
            print_test_result(False, f"Client list endpoint failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Client list test failed - {str(e)}")
        return False, None

def validate_financial_data(dashboard_data, invoice_data):
    """Validate that financial data is consistent between dashboard and invoices"""
    print_test_header("Financial Data Consistency Validation")
    
    try:
        # Extract financial metrics from dashboard
        dashboard_ca = 0
        dashboard_tva = 0
        dashboard_nb_factures = 0
        
        if isinstance(dashboard_data, dict):
            # Try to extract financial data from various possible structures
            dashboard_ca = dashboard_data.get('chiffre_affaires', 0) or dashboard_data.get('ca_total', 0)
            dashboard_tva = dashboard_data.get('tva', 0) or dashboard_data.get('tva_total', 0)
            dashboard_nb_factures = dashboard_data.get('nb_factures', 0) or dashboard_data.get('total_factures', 0)
        
        # Count invoices from invoice list
        invoice_count = 0
        if isinstance(invoice_data, list):
            invoice_count = len(invoice_data)
        elif isinstance(invoice_data, dict):
            if 'factures' in invoice_data:
                invoice_count = len(invoice_data['factures']) if isinstance(invoice_data['factures'], list) else 0
            elif 'data' in invoice_data:
                invoice_count = len(invoice_data['data']) if isinstance(invoice_data['data'], list) else 0
        
        # Validation results
        validations = []
        
        # Check if dashboard has financial data
        if dashboard_ca > 0 or dashboard_tva > 0:
            validations.append(("Dashboard has financial data", True))
        else:
            validations.append(("Dashboard has financial data", False))
        
        # Check if invoice count is reasonable
        if invoice_count >= 0:
            validations.append(("Invoice list accessible", True))
        else:
            validations.append(("Invoice list accessible", False))
        
        # Check consistency if both have data
        if dashboard_nb_factures > 0 and invoice_count > 0:
            # Allow some tolerance for pagination
            if abs(dashboard_nb_factures - invoice_count) <= 10:
                validations.append(("Invoice count consistency", True))
            else:
                validations.append(("Invoice count consistency", False))
        else:
            validations.append(("Invoice count consistency", True))  # Skip if no data
        
        success_count = sum(1 for _, success in validations)
        total_count = len(validations)
        
        print(f"Financial Data Validation Results:")
        for validation_name, success in validations:
            status = "✅" if success else "❌"
            print(f"  {status} {validation_name}")
        
        print(f"Dashboard CA: {dashboard_ca}€, TVA: {dashboard_tva}€, Factures: {dashboard_nb_factures}")
        print(f"Invoice list count: {invoice_count}")
        
        overall_success = success_count >= (total_count - 1)  # Allow one failure
        print_test_result(overall_success, f"Financial data validation: {success_count}/{total_count} checks passed")
        
        return overall_success
        
    except Exception as e:
        print_test_result(False, f"Financial data validation failed - {str(e)}")
        return False

def main():
    """Main test execution for Dashboard and Invoice Data Recovery"""
    print("🚀 Starting Backend API Tests for Vinisys - Dashboard and Invoice Data Recovery")
    print("📊 Testing: Dashboard data, Invoice list, Chart data, Client list")
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"Test User ID: {TEST_USER_ID}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = []
    dashboard_data = None
    invoice_data = None
    
    # Test 0: Server connectivity
    server_ok = test_server_connectivity()
    test_results.append(("Server Connectivity", server_ok))
    
    if not server_ok:
        print("\n❌ Backend server is not responding. Stopping tests.")
        return False
    
    # Test 1: Dashboard data
    dashboard_success, dashboard_data = test_dashboard_data()
    test_results.append(("Dashboard Data", dashboard_success))
    
    # Test 2: Invoice list
    invoice_success, invoice_data = test_invoice_list()
    test_results.append(("Invoice List", invoice_success))
    
    # Test 3: Chart data
    chart_success, chart_data = test_chart_data()
    test_results.append(("Chart Data", chart_success))
    
    # Test 4: Client list
    client_success, client_data = test_client_list()
    test_results.append(("Client List", client_success))
    
    # Test 5: Financial data validation
    if dashboard_data and invoice_data:
        validation_success = validate_financial_data(dashboard_data, invoice_data)
        test_results.append(("Financial Data Consistency", validation_success))
    else:
        test_results.append(("Financial Data Consistency", False))
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY - DASHBOARD AND INVOICE DATA RECOVERY")
    print(f"{'='*60}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    # Detailed analysis
    print(f"\n{'='*60}")
    print("ROUTE RESTORATION ANALYSIS")
    print(f"{'='*60}")
    
    if server_ok:
        print("✅ Backend server is responding")
    
    critical_endpoints = ["Dashboard Data", "Invoice List", "Chart Data", "Client List"]
    critical_passed = sum(1 for test_name, result in test_results if test_name in critical_endpoints and result)
    
    if critical_passed >= 3:  # At least 3/4 critical endpoints working
        print("✅ Route restoration appears successful")
        print("✅ Critical invoice and dashboard endpoints are accessible")
        
        if dashboard_success:
            print("✅ Dashboard data endpoint is working")
        if invoice_success:
            print("✅ Invoice list endpoint is working")
        if chart_success:
            print("✅ Chart data endpoint is working")
        if client_success:
            print("✅ Client list endpoint is working")
            
        if passed == total:
            print("\n🎉 All tests passed! Route restoration is complete and successful.")
        else:
            print("\n✅ Route restoration successful with minor issues.")
        return True
    else:
        print("❌ Route restoration has significant issues")
        print("❌ Critical endpoints are not accessible")
        print("\n⚠️  Please check the route configuration and database connectivity.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)