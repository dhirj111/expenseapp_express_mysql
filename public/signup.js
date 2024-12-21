
const handleformsubmit = (event) => {
  event.preventDefault();

  console.log(event.target.name.value)
  const userDetails = {
    name: event.target.name.value,
    email: event.target.email.value,
    password: event.target.password.value
  };
  // console.log(userDetails)
  axios
    .post("http://localhost:5000/signup", userDetails)
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      // console.error('Error details:', error.response ? error.response.data : error.message);
      alert('Failed to create product');
    });
};