
const handleformsubmit = (event) => {
  event.preventDefault();
  const userDetails = {
    name: event.target.name.value,
    email: event.target.email.value,
    password: event.target.password.value
  };
  // console.log(userDetails)
  axios
    .post("https://localhost:5000/signup", userDetails)
    .then((response) => {
      document.getElementById('note').textContent = "message for user == "
      document.getElementById('note').textContent += response.data.message;
    })
    .catch((error) => {
      document.getElementById('note').textContent = "message for user == "
      document.getElementById('note').textContent += error.response.data.message;
    });
};