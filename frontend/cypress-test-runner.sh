#!/bin/bash

# Cypress Cucumber Test Runner Script
# This script provides various options for running Cypress tests with Cucumber

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${GREEN}Cypress Cucumber Test Runner${NC}"
    echo ""
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  open         - Open Cypress Test Runner GUI"
    echo "  run          - Run all tests headlessly"
    echo "  headed       - Run all tests with browser visible"
    echo "  chrome       - Run tests in Chrome"
    echo "  firefox      - Run tests in Firefox"
    echo "  feature      - Run specific feature file"
    echo "  tag          - Run tests with specific tag"
    echo "  smoke        - Run smoke tests only"
    echo "  regression   - Run regression tests"
    echo "  report       - Generate test report after running"
    echo "  clean        - Clean test results and reports"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 open"
    echo "  $0 run"
    echo "  $0 feature login"
    echo "  $0 tag @smoke"
}

# Function to clean test results
clean_results() {
    echo -e "${YELLOW}Cleaning test results and reports...${NC}"
    rm -rf cypress/reports/*
    rm -rf cypress/screenshots/*
    rm -rf cypress/videos/*
    echo -e "${GREEN}Clean complete!${NC}"
}

# Function to generate report
generate_report() {
    echo -e "${YELLOW}Generating test report...${NC}"
    if [ -f "cypress/reports/cucumber-report.json" ]; then
        echo -e "${GREEN}Report generated at: cypress/reports/cucumber-report.html${NC}"
    else
        echo -e "${RED}No test results found. Run tests first.${NC}"
    fi
}

# Main script logic
case "$1" in
    open)
        echo -e "${GREEN}Opening Cypress Test Runner...${NC}"
        npm run cypress:open
        ;;
    run)
        echo -e "${GREEN}Running all tests headlessly...${NC}"
        npm run cypress:run
        ;;
    headed)
        echo -e "${GREEN}Running all tests with browser visible...${NC}"
        npm run cypress:headed
        ;;
    chrome)
        echo -e "${GREEN}Running tests in Chrome...${NC}"
        npm run cypress:chrome
        ;;
    firefox)
        echo -e "${GREEN}Running tests in Firefox...${NC}"
        npm run cypress:firefox
        ;;
    feature)
        if [ -z "$2" ]; then
            echo -e "${RED}Please specify a feature name${NC}"
            echo "Example: $0 feature login"
            exit 1
        fi
        echo -e "${GREEN}Running feature: $2${NC}"
        npx cypress run --spec "cypress/e2e/features/$2.feature"
        ;;
    tag)
        if [ -z "$2" ]; then
            echo -e "${RED}Please specify a tag${NC}"
            echo "Example: $0 tag @smoke"
            exit 1
        fi
        echo -e "${GREEN}Running tests with tag: $2${NC}"
        npx cypress run --env tags="$2"
        ;;
    smoke)
        echo -e "${GREEN}Running smoke tests...${NC}"
        npx cypress run --env tags="@smoke"
        ;;
    regression)
        echo -e "${GREEN}Running regression tests...${NC}"
        npx cypress run --env tags="@regression"
        ;;
    report)
        npm run cypress:run
        generate_report
        ;;
    clean)
        clean_results
        ;;
    help)
        usage
        ;;
    *)
        echo -e "${RED}Invalid option: $1${NC}"
        usage
        exit 1
        ;;
esac