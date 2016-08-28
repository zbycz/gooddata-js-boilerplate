#!/bin/bash


if [[ $# -ne 1 ]]; then
    echo "Usage: $0 testclass[,testclass2,...]"
    exit 1
fi

MVN_OPTS="-Dtest=$1"
echo "Running $1"

set -o pipefail

mvn clean install -Pselenium -am -pl ui-tests-core $MVN_OPTS -DignoreFailedTests=false 2>&1 | tee $1-full.log | awk '/Results :/,/Tests run:/'
