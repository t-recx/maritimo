#!/bin/bash

rm -rf ./.env

env | grep MARITIMO_FRONTEND | sed 's/MARITIMO_FRONTEND/REACT_APP/' | sed 's/=/="/' | sed 's/$/"/' > .env