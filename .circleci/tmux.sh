#!/usr/bin/env bash

tmux kill-session -t homeland || true
tmux new -d -s homeland './.circleci/start_bot.sh'