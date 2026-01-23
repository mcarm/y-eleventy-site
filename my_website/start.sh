#!/bin/bash

# Portfolio Site Startup Script
# Launches Eleventy frontend + Decap CMS admin

cd "$(dirname "$0")"

echo "🚀 Starting Portfolio Site..."
echo "================================"
echo "Frontend: http://localhost:8080"
echo "Admin CMS: http://localhost:8080/admin/"
echo "================================"
echo ""

# Function to commit and push changes
commit_changes() {
    echo ""
    echo "📝 Git Commit Helper"
    echo "--------------------"
    
    # Show current status
    git status --short
    
    echo ""
    read -p "Enter commit message (or 'q' to cancel): " msg
    
    if [ "$msg" != "q" ] && [ -n "$msg" ]; then
        git add .
        git commit -m "$msg"
        
        read -p "Push to remote? (y/n): " push_choice
        if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
            git push
            echo "✅ Changes pushed!"
        else
            echo "✅ Changes committed locally."
        fi
    else
        echo "Cancelled."
    fi
}

# Menu
show_menu() {
    echo ""
    echo "Commands:"
    echo "  1) Start dev server (frontend + admin)"
    echo "  2) Commit & push changes"
    echo "  3) Build for production"
    echo "  q) Quit"
    echo ""
    read -p "Choose option: " choice
    
    case $choice in
        1)
            npm run dev
            ;;
        2)
            commit_changes
            show_menu
            ;;
        3)
            npm run build:prod
            show_menu
            ;;
        q|Q)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid option"
            show_menu
            ;;
    esac
}

# Check if npm dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@11ty" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

show_menu
