export function emptyState(msg = 'No fixtures found.') {
  return `<div class="state state--empty">${msg}</div>`;
}

export function errorState(msg = 'Something went wrong') {
  return `<div class="state state--error">${msg}</div>`;
}

