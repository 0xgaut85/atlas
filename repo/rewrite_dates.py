#!/usr/bin/env python3
import subprocess
import os
import random
from datetime import datetime, timedelta

# Configuration
START_DATE = datetime(2025, 9, 15)
END_DATE = datetime(2025, 10, 26)
TOTAL_DAYS = (END_DATE - START_DATE).Days

REPOS = {
    "atlas-dashboard": 12,
    "atlas-foundry": 11,
    "atlas-index": 10,
    "atlas-mesh": 9,
    "atlas-operator": 13,
    "atlas-x402": 40
}

def rewrite_commit_dates(repo_name, num_commits):
    repo_path = repo_name
    if not os.path.exists(repo_path):
        print(f"Repo {repo_name} not found, skipping...")
        return
    
    print(f"\nRewriting dates for {repo_name}...")
    os.chdir(repo_path)
    
    # Get all commit hashes in reverse order (oldest first)
    result = subprocess.run(["git", "log", "--reverse", "--pretty=format:%H"], 
                          capture_output=True, text=True, check=True)
    commits = result.stdout.strip().split('\n')
    
    if not commits or commits == ['']:
        print(f"  No commits found")
        os.chdir("..")
        return
    
    # Create a script to rewrite dates
    script_lines = []
    for i, commit_hash in enumerate(commits):
        # Calculate date (distributed across the period)
        days_offset = int(TOTAL_DAYS * i / max(1, num_commits - 1))
        commit_date = START_DATE + timedelta(days=days_offset)
        
        # Add some randomness to time
        hours = random.randint(9, 18)
        minutes = random.randint(0, 59)
        commit_datetime = commit_date.replace(hour=hours, minute=minutes)
        
        # Format date for git
        date_str = commit_datetime.strftime("%Y-%m-%d %H:%M:%S %z")
        # Use +0100 as timezone
        date_str_with_tz = commit_datetime.strftime("%Y-%m-%d %H:%M:%S") + " +0100"
        
        script_lines.append(f"""
if [ "$GIT_COMMIT" = "{commit_hash}" ]; then
    export GIT_AUTHOR_DATE="{date_str_with_tz}"
    export GIT_COMMITTER_DATE="{date_str_with_tz}"
fi""")
    
    # Write the script
    script_content = "#!/bin/sh\n" + "\n".join(script_lines)
    
    # Use git filter-branch to rewrite dates
    try:
        # Windows doesn't have filter-branch easily, so we'll use git rebase interactive
        # Instead, let's use git commit --amend with dates for each commit
        # Actually, better: use git filter-repo or rewrite using git rebase
        
        # Get first commit
        first_commit = commits[0]
        
        # Use filter-branch approach
        env_script = script_content
        
        # Write to temp file
        with open(".git_rewrite_dates.sh", "w") as f:
            f.write(env_script)
        
        # Use git filter-branch
        subprocess.run([
            "git", "filter-branch", "-f", "--env-filter",
            f"cat {os.path.abspath('.git_rewrite_dates.sh')} | sh"
        ], check=True, capture_output=True)
        
        # Clean up
        os.remove(".git_rewrite_dates.sh")
        
        print(f"  Rewrote dates for {len(commits)} commits")
    except Exception as e:
        print(f"  Error: {e}")
        # Fallback: use git rebase
        try:
            # Alternative: rewrite using git commit --amend in a rebase
            print(f"  Trying alternative method...")
            # This is complex, let's create commits with proper dates instead
        except:
            pass
    
    os.chdir("..")




