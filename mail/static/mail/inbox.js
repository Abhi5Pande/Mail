//console.log("THis is the JS file ")
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  //console.log("main function");
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(r='',s='',b='') {
  //console.log("Inside compose emails");
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-read').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-read').innerHTML="";

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = r;
  document.querySelector('#compose-subject').value = s;
  document.querySelector('#compose-body').value = b;
  document.querySelector('#compose-form').onsubmit = () => {
     console.log("Form submit btm clicked");
    let recipients = document.querySelector('#compose-recipients').value;
      let subject = document.querySelector('#compose-subject').value;
      let body = document.querySelector('#compose-body').value;
     console.log(recipients,subject,body);
    fetch('/emails',{
      method:'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body:body 
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  load_mailbox('sent');
  return false;
  }
}
function load_email(id,mailbox)
{
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-read').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    let email_dets = document.createElement("div");
    email_dets.classList.add("email-dets")
    let button = document.createElement("button")
    button.classList.add("archive")
    button.innerHTML = `Archive`;
    let reply = document.createElement("button")
    reply.innerHTML = "Reply"
    email_dets.innerHTML = `
      <div>From: ${email.sender}<br>To:${email.recipients}<br> ${email.timestamp}
      </div>
      <hr>
      <div>Subject: ${email.subject}</div>
      <hr>
      <div> Body:<br>${email.body} </div>
    `
    if(mailbox==='inbox'){
      document.querySelector('#email-read').append(button);
    }
    document.querySelector("#email-read").append(reply);
    document.querySelector('#email-read').append(email_dets);

    reply.onclick = () => {
      if(mailbox==='inbox' || mailbox==='archive'){
      compose_email(email.sender,email.subject)
      }
      else{
        compose_email(email.recipients,email.subject)        
      }
    }
    button.onclick = ()=>{
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
      load_mailbox('inbox');
    }
  })
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  
}
function show_mail(emails,mailbox){
//console.log("In show mail")
    console.log(emails)
 
    for(let i = 0 ; i < emails.length ; i++)
    {
  //    console.log(emails[i]);
     
      let mail = document.createElement("div");
      mail.classList.add('email');
      if(emails[i].read)
        {
          mail.classList.add('is_read')
        }
      
      if(mailbox==='sent'){
      mail.innerHTML = `
        <div class="sent_mailbox"> To: ${emails[i].recipients} </div>
        <div> Subject - ${emails[i].subject} </div>
        <div> ${emails[i].timestamp}</div>
      ` 
      }
      else if(mailbox==='inbox'){
        mail.innerHTML = `
        <div class="sent_mailbox"> From: ${emails[i].sender} </div>
        <div> Subject - ${emails[i].subject} </div>
        <div> ${emails[i].timestamp}</div>
      `
      }
      else if(mailbox==='archive'){
        mail.innerHTML = `
        <div class="sent_mailbox"> From: ${emails[i].sender} </div>
        <div> Subject - ${emails[i].subject} </div>
        <div> ${emails[i].timestamp}</div>
      `
      }
      mail.addEventListener('click',() => load_email(emails[i].id,mailbox))
      document.querySelector('#emails-view').append(mail);
    }

}
function load_mailbox(mailbox) {
  //console.log("IN load mail section")
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-read').style.display = 'none';
  document.querySelector('#email-read').innerHTML = '';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then( response => response.json())
  .then(emails => {
    //console.log(emails);
    show_mail(emails,mailbox)
  });
}