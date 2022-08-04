module.exports = {
  '**/*.(ts|vue)': (filenames) => [
    `npx eslint ${filenames.join(' ')}`,
    `npx prettier ${filenames.join(' ')}`,
  ],
  '**/*.(css|scss|vue)': (filenames) => `stylelint ${filenames.join(' ')}`,
  '**/*.(md|json)': (filenames) => `npx prettier ${filenames.join(' ')}`,
}
