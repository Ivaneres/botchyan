#!/usr/bin/env bash

tmux kill-session -t anime || true
tmux new -d -s anime './.circleci/start_bot.sh'