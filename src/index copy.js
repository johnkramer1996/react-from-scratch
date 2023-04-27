const React = {
  createElement,
  redner,
}

const container = document.getElementById('root')

export const App = () => {
  const a = 1
  return React.createElement('h1', {}, 123)
}

try {
  Didact.render(React.createElement(App), container)
} catch (e) {
  console.log({ e })
}
