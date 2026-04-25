#!/bin/bash

# skills.sh - Agent Skills Management Script
# Integrates with .agents/skills directory

SKILLS_DIR="./.agents/skills"

show_help() {
    echo "Usage: bash skills.sh [command]"
    echo ""
    echo "Commands:"
    echo "  list        List all installed skills"
    echo "  show [name] Show details of a specific skill"
    echo "  help        Show this help message"
}

list_skills() {
    if [ ! -d "$SKILLS_DIR" ]; then
        echo "No skills directory found at $SKILLS_DIR"
        exit 1
    fi

    echo "Installed Skills:"
    echo "----------------"
    for skill in "$SKILLS_DIR"/*; do
        if [ -d "$skill" ]; then
            name=$(basename "$skill")
            desc=$(grep -m 1 "description:" "$skill/SKILL.md" | sed 's/description: //')
            echo "- $name: $desc"
        fi
    done
}

show_skill() {
    local name=$1
    if [ -z "$name" ]; then
        echo "Error: Please specify a skill name."
        exit 1
    fi

    local skill_file="$SKILLS_DIR/$name/SKILL.md"
    if [ -f "$skill_file" ]; then
        cat "$skill_file"
    else
        echo "Skill '$name' not found."
    fi
}

case "$1" in
    list)
        list_skills
        ;;
    show)
        show_skill "$2"
        ;;
    help|*)
        show_help
        ;;
esac
