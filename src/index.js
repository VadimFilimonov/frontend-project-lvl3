import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as yup from 'yup';

const schema = yup.object().shape({
  url: yup.string().url(),
});

const form = document.querySelector('form');
const input = form.querySelector('input');
const feedback = document.querySelector('.feedback');

const proxyUrl = (url) =>
  `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`;

const showError = () => {
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = 'Ссылка должна быть валидным URL';
};

const processForm = () => {
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.textContent = '';
  form.reset();
};

const parseXML = (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/html');
  console.log(doc);
  return doc;
};

const validate = (url) => schema.isValid({ url });

const onSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const url = formData.get('url');
  validate(url)
    .then((isValid) => {
      if (isValid) {
        processForm();
        return axios.get(proxyUrl(url));
      }
      throw new Error('URL is not valid');
    })
    .then((response) => {
      parseXML(response.data.contents);
      return response.data.contents;
    })
    .catch(() => {
      showError();
    });
};

const subscribe = () => {
  form.addEventListener('submit', onSubmit);
};

const init = () => {
  subscribe();
};

init();
