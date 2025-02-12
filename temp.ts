const getUser = () => {
  const user = {
    name: "Tirth",
    age: 21
  }
  return user
} 



let { name } = getUser()
console.log(name)
