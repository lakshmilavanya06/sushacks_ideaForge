document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (name && email && password) {
    const button = document.querySelector('button[type="submit"]');
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;

    try {
      const response = await fetch('https://ideaforge-1.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: name, email, password })
      });

      const result = await response.json();

      if (response.ok) {
        alert("Signup successful!");
        window.location.href = "dashboard.html";
      } else {
        alert(result.message || "Registration failed.");
        button.innerHTML = 'Sign Up';
        button.disabled = false;
      }
    } catch (err) {
      alert("Server error. Please try again later.");
      button.innerHTML = 'Sign Up';
      button.disabled = false;
    }
  } else {
    alert("Please fill in all fields.");
  }
});

// Password toggle functionality
const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');

togglePassword.addEventListener('click', function () {
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  this.classList.toggle('fa-eye-slash');
});
