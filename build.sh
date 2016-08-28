#!/bin/bash

set -e
set -x

RPMDIR="$PWD/packages/artifacts"

rm -rf "$RPMDIR"
[ -f hiera.fragment.txt ] && rm -f hiera.fragment.txt
mkdir -p "$RPMDIR"

# Versin is injected or build is local - use component pipelines
if [ -n "$GDCVERSION" ]; then
    VERSION=$GDCVERSION
else
    VERSION=local
fi

# Compress content of this git repository into tar with format: {name}.tag.gz
tar czf gdc-analytical-designer.tar.gz $(git ls-tree --name-only HEAD) .git

# Create RPM
rpmbuild -bb \
    --define "_rpmdir $RPMDIR" \
    --define "_builddir $PWD" \
    --define "_sourcedir $PWD" \
    --define "_rpmfilename %{NAME}-%{VERSION}-%{RELEASE}.%{ARCH}.rpm" \
    --define "gdcversion $VERSION" \
    specs/gdc-analytical-designer.spec
