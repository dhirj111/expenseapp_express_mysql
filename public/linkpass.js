
const handleformsubmit1 = (event) => {
  document.getElementById('note').textContent = "message for user==";
  event.preventDefault();

  const path = window.location.pathname;
console.log("path is =" ,path)
  // Split the path into parts
  const pathParts = path.split('/');

  // Get the last part, which is the 'sid'
  const sid = pathParts[pathParts.length - 1];
  console.log("sid is =" ,sid)
  const userDetails = {
    sid: sid,
    password: event.target.password.value
  };
  axios
    .post("http://localhost:5000/password/linkandurl", userDetails)
    .then((response) => {
      console.log("this is response of linkpass.js file response", response)
      document.getElementById('note').textContent += response.data.message;
      // if (response.data.urltoredirect) {
      //   localStorage.setItem("user jwt", response.data.usertoken)
      //   window.location.href = response.data.urltoredirect;
      //   //it redirected because we provided urltoredirect as a reponse to /login password correct condition 
      // }
      console.log(response.data.message)
    })
    .catch((error) => {
      //any response consisting http error codes ,ie passowrd mismatch/user not exist automatically comes here
      console.log(error)
      console.log(error.response.data.message)
      document.getElementById('note').textContent += error.response.data.custommessage;
    });
};