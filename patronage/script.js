/* MENU BUTTONS */
const logInBtn = document.querySelector('.log-in-button');
const registrationBtn = document.querySelector('.register-button');
const logOutBtn = document.querySelector('.log-out-button');

/* VIEWS SELECTORS*/
const homeDiv = document.querySelector('.home-view');
const logInDiv = document.querySelector('.log-in-view');
const registrationDiv = document.querySelector('.registration-view');
const loggedUserDiv = document.querySelector('.logged-user-view');

/*  hides all unnecessary elements  */
const hideAll = () => [homeDiv, logInDiv, registrationDiv, loggedUserDiv, logInBtn, registrationBtn, logOutBtn]
    .forEach(el => el.style.display = 'none')

hideAll()
/* hide error function */
const hideErrors = (errorArray) => {
    errorArray.forEach(error => {
        error.innerText = '';
    })
};

/* hash password function */
const salt = 'iY&S*(^870[9rw9&*'
const hashCode = password => (password.split('').reduce((a, b) => (
    ((a << 5) - a) + b.charCodeAt(0))|0, 0) + salt);

/* check local storage and logged user */
const usersArray = localStorage.getItem('users') ? 
  JSON.parse(localStorage.getItem('users')) : [];
const [user] = usersArray.filter(el => el.logged);

/* built views */
/* logged user view */
const loggedUserView = async (user) => {
    hideAll();
    const errorData = document.querySelector('.error-data')
    const transacationHistory = document.querySelector('.transactions-history');
    const userName = document.querySelector('.user-name');
    const chart1 = document.querySelector('.chart1')
    const chart2 = document.querySelector('.chart2')
    const charts = document.querySelector('.charts')
    const ctx = document.getElementById('chart1');
    const ctx2 = document.getElementById('chart2');
    let data;
    errorData.innerText = '';
    
    userName.innerText = `Użytkownik ${user.name}`
    logOutBtn.style.display = 'block';
    loggedUserDiv.style.display = 'block';
    /* Fetch */
    try {
    const url = 'https://api.npoint.io/38edf0c5f3eb9ac768bd';
    const res = await fetch(url);
    data = await res.json();
    } catch (e) {
        errorData.innerText= 'Przepraszamy, wystąpił błąd. Spróbuj później'
        console.log('Error with fetch data', e);
    }
    /* Chart 1 (doughnut) */
    const chart1labels = [];
    const chart1data = [];
    const {transacationTypes, transactions} = await data;
    transactions.forEach(el => {
        const elType = el.type;
        const amount = (transactions.filter(el => el.type === elType).map(el => el.amount)).reduce((prev, curr) => prev + curr, 0)
        if(!chart1labels.includes(elType)) {
            chart1labels.push(elType);
            chart1data.push(amount);
        };
    })
    chart1data.forEach(el => el < 0 ? el * -1 : el)

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chart1labels.map(el => transacationTypes[el]),
            datasets: [{
              label: 'Operacje w PLN',
              data: chart1data.map(el => el > 0 ? el : el * -1),
              backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(21, 211, 47)'
              ],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
    /* Chart 2 (bar)*/
    const barDates = [];
    const barData = [];
    transactions.forEach(obj => {
        !barDates.includes(obj.date) ? barDates.push(obj.date) : null;
    })
    
    barDates.forEach(el => {
        const transaction = transactions.filter(obj => obj.date === el);
        const payment = transaction.map(obj => obj.amount);
        const dailyPayments = payment.reduce((prev, curr) => prev + curr, 0)
        barData.push({
            x: el,
            y: dailyPayments,
            backgroundColor: dailyPayments > 0 ? 'rgb(0, 201, 0)' : 'rgb(201, 0, 0)',
        })
    })

    new Chart(ctx2, {
            type: 'bar',
            data: {
                datasets: [{
                    label: 'Dzienny bilans w PLN',
                    data: barData,
                    backgroundColor: barData.map(el => el.backgroundColor)
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            },
    });

    
    /* Transactions history */
    const table = document.createElement('table');
    transacationHistory.appendChild(table);
    const fields = [];
    /* making table rows */
    transactions.map(transaction => {
        const tr = document.createElement('tr');
        tr.classList.add('table-row')
        table.appendChild(tr);
        const entries = Object.entries(transaction);
        if (screen.width <= 768) {
            const dateElement = entries.splice(0, 1);
            const balanceElement = entries.splice(2,1);
            entries.push(dateElement[0])
            entries.push(balanceElement[0])
        }
        entries.map(pair => {
            const td = document.createElement('td');
            td.classList.add('center');
            const key = document.createElement('p');
            td.classList.add(pair[0]);
            key.innerText = pair[0];
        if (pair[0] === 'type') {
            const img = document.createElement('img');
            img.src = `./public/img/transaction-type/${pair[1]}.png`;
            img.classList.add('icon')
            td.appendChild(img);
        } else {
            const value = key.cloneNode(false);
            value.innerText = pair[1];
            td.appendChild(value);
        }
        tr.appendChild(td);
        fields.push(td)
      })
    })
    /* change view options for small screen */
    if (screen.width <= 768) {
        const rowsArray = Array.from(document.querySelectorAll('.table-row'))
        chart2.classList.add('hidden');
        const hideTableFields = (arrayOfFields) => {
            arrayOfFields.map(el => {
                const fieldClasses = Array.from(el.classList)
                if (fieldClasses.includes('date') || fieldClasses.includes('balance')) {
                    el.classList.add('hidden');
                    el.classList.remove('center');
                }
            })  
        } 
        hideTableFields(fields)

        rowsArray.map(el => el.addEventListener('click', function() {
            const children = Array.from(this.children)
            const dateField = (children.filter(child => Array.from(child.classList).includes('date')))[0];
            const balanceField = (children.filter(child => Array.from(child.classList).includes('balance'))[0]);
            dateField.classList.toggle('center');
            balanceField.classList.toggle('center');
        }))
        charts.addEventListener('click', () => [chart1, chart2].map(el => {
            el.classList.toggle('hidden');
        }));
    }
}
/* home view */
const homeView = () => {
    hideAll();
    logInBtn.style.display = 'block';
    registrationBtn.style.display = 'block';
    homeDiv.style.display = 'flex';
}
/* log in view */
const logInView = () => {
    hideAll();
    registrationBtn.style.display = 'block';
    logInDiv.style.display = 'block';

    const nameEmailInput = document.querySelector('.login-email-name');
    const nameEmailError = document.querySelector('.login-email-name-error');
    const password = document.querySelector('.login-password');
    const passwordError = document.querySelector('.login-password-error');
    const sendBtn = document.querySelector('.login-button');

    nameEmailInput.value = '';
    password.value = '';
/* login view listeners */
    sendBtn.addEventListener('click', e => {
        e.preventDefault();

        hideErrors([nameEmailError, passwordError]);
        let loggedUser;
        /* checking user data */
        if ((usersArray.filter(user => nameEmailInput.value === user.name)).length) {
            [loggedUser] = usersArray.filter(user => nameEmailInput.value === user.name)
        } else if ((usersArray.filter(user => nameEmailInput.value === user.email)).length) {
            [loggedUser] = usersArray.filter(user => nameEmailInput.value === user.email)
        } else {
            nameEmailError.innerText = 'Nie poprawny login lub email';
        }
        if (loggedUser) { 
            /* login user or show error message */
            if (loggedUser.password === hashCode(password.value)) {
                loggedUser.logged = true;
                localStorage.setItem('users', JSON.stringify(usersArray))
                return loggedUserView(loggedUser);
            } else {
                passwordError.innerText = 'Nie poprawne hasło'
            }
        }
        return
    })
}
/* log out and return home view*/
const logOut = () => {
    hideAll();
    usersArray.forEach(user => user.logged = false);
    localStorage.setItem('users', JSON.stringify(usersArray));
    location.reload();
    return homeView();
}
/* registration view */
const registrationView = () => {
    hideAll();
    logInBtn.style.display = 'block';
    registrationDiv.style.display = 'block';
    /*validation with regular expression function */
    const validate = (string, regExp) => {
        const regex =  new RegExp(regExp); 
        return regex.test(string)
    }
    const nameInput = document.querySelector('.register-name-input');
    const emailInput = document.querySelector('.register-email-input');
    const checkEmailInput = document.querySelector('.register-check-email-input');
    const passwordInput = document.querySelector('.register-password-input');
    const nameError = document.querySelector('.register-name-error');
    const emailError = document.querySelector('.register-email-error');
    const checkEmailError = document.querySelector('.register-check-email-error');
    const passwordError = document.querySelector('.register-password-error');
    const sendBtn = document.querySelector('.registration-button');

    [nameInput, emailInput, checkEmailInput, passwordInput].map(el => el.value = '')
    hideErrors([nameError, emailError, checkEmailError, passwordError])

    sendBtn.addEventListener('click', e => {
        e.preventDefault()
        const user = {
            name: '',
            email: '',
            password: '',
            logged: false,
          };

        hideErrors([nameError, emailError, checkEmailError, passwordError])
          /* Validation name input. 
          First validation checks if the name consists of the correct characters and has the correct length.
          Second validation checks if the name contains the correct number of letters.
          If the name is incorrect, it shows error message
          */
        validate(nameInput.value, '[a-zA-Z0-9\-\_\/\[\\]]{6,16}') && validate(nameInput.value, '(?=.*[a-zA-Z]){5,}(?=.*[0-9]{1,})') ? 
            user.name = nameInput.value : nameError.innerText = 'błędna nazwa';
        /* Validation e-mail input.
        Validation checks if the email contains correct parts of e-mail adress
         */
        validate(emailInput.value, '^[a-zA-Z0-9_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}') ? 
            user.email = emailInput.value : emailError.innerText = 'błędny email';
        /* Checks if e-mail input value is equal to check e-mail input value  */
        checkEmailInput.value === emailInput.value ? 
            null : checkEmailError.innerText = 'błędny email';
        /* Checks if the password is of the correct length */
        passwordInput.value.length >= 8 ? 
            user.password = hashCode(passwordInput.value) : passwordError.innerText = 'błędne hasło';
        /* Checks if the name is taken  */
        if ((usersArray.filter(user => nameInput.value === user.name)).length) {
            user.name = '';
            return nameError.innerText = 'nazwa jest już zajęta';
        }
        /* Checks if the e-mail is taken */
        if ((usersArray.filter(user => emailInput.value === user.email)).length) {
            user.email = '';
            return emailError.innerText = 'adres email jest już zajęty'
        }
        /* If every thing is correct create new user and add it to local storage */
        if (
            user.name && 
            user.email && 
            user.email === checkEmailInput.value && 
            user.password
            ) {
              user.logged = true;
              usersArray.push(user);
              localStorage.setItem('users', JSON.stringify(usersArray))
              return loggedUserView(user)
          }
    });
}
/* Checks if some user is logged if not then return home view */
if (user) {
    loggedUserView(user);
} else {
    homeView();
}
/* listeners */
logInBtn.addEventListener('click', logInView);
registrationBtn.addEventListener('click', registrationView);
logOutBtn.addEventListener('click', logOut)
