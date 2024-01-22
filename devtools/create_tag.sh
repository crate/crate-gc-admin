#!/usr/bin/env bash

function print_error() {
  echo -e "\033[31mE\033[0m $@"
}

function print_info() {
  echo -e "\033[35mI\033[0m $@"
}

print_info "Create release for crate-gc-admin"
print_info "Working directory: $(pwd)"
print_info "Date: $(date)"

if ! [[ -z "$(git status -s)" ]]; then
  print_error "Working directory not clean."
  print_error "Please commit all changes before tagging."
  exit 1
fi

git fetch origin

BRANCH="$(git branch | grep "^*" | cut -d " " -f 2)"

if [[ "$BRANCH" != "master" ]]; then
  print_error "$0 must be executed on master branch."
  exit 1
fi

LOCAL_COMMIT="$(git show --format='%H' $BRANCH)"
ORIGIN_COMMIT="$(git show --format='%H' origin/$BRANCH)"

if [[ "$LOCAL_COMMIT" != "$ORIGIN_COMMIT" ]]; then
  print_error "Local $BRANCH is not up to date. "
  exit 1
fi

VERSION="$(yarn version --non-interactive | grep 'info Current version' | rev | cut -d' ' -f 1 | rev)"

echo
print_info "Do you want to tag version $VERSION now?"
read -p "[Y]es/[N]o: " -n 1 -r ret
echo

if [[ $ret =~ ^[Yy]$ ]]; then
  print_info "Create tag for version $VERSION ..."
  git tag -a "$VERSION" -m "Tag release for revision $VERSION"
  print_info "Push tags to origin ..."
  git push --tags
  print_info "All done! ✨"
else
  print_error "Cancelled."
  exit 2
fi
