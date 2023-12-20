export const translate = (label, args = {}, code) => {
  Object.keys(args).forEach((name) => {
    label = label.replaceAll(`{${name}}`, args[name])
  })
  return label
}


export default {
  translate
}