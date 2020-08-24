const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'arnabpoddar.ap@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app ${name}!. We hope you will have a great experience. `,    //We can also add html data 
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'arnabpoddar.ap@gmail.com',
        subject: 'GoodBye!',
        text: `Goodbye ${name}!. Thank you for using our application. `,    
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}