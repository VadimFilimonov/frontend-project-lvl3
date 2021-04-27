import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';

let state;
let watchedState;

const schema = yup.object().shape({
  url: yup
    .string()
    .url('Ресурс не содержит валидный RSS')
    .test(
      'Uniq url',
      'RSS уже существует',
      (value) => !state.urls.includes(value)
    ),
});

const form = document.querySelector('form');
const input = form.querySelector('input');
const feedback = document.querySelector('.feedback');

const feeds = document.querySelector('.feeds');
const posts = document.querySelector('.posts');

const proxyUrl = (url) =>
  `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`;

const showError = (error) => {
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = error;
};

const processForm = () => {
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = 'RSS успешно загружен';
  form.reset();
};

const parseXML = (string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(string, 'text/html');
  return doc;
};

const getFeed = (xml) => {
  const title = xml.querySelector('title').textContent;
  const description = xml.querySelector('description').textContent;
  return { title, description };
};

const getPosts = (xml) => {
  const items = [...xml.querySelectorAll('item')];
  const mapped = items.map((item) => ({
    title: item.querySelector('title').textContent,
    guid: item.querySelector('guid').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
    pubdate: item.querySelector('pubdate').textContent,
  }));
  return mapped;
};

const validate = (url) => schema.validate({ url });

const onSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const url = formData.get('url');
  validate(url)
    .then(() => {
      processForm();
      return axios.get(proxyUrl(url));
    })
    .then((response) => {
      const xmlDom = parseXML(response.data.contents);
      const newFeed = getFeed(xmlDom);
      const newPosts = getPosts(xmlDom);
      watchedState.urls.push(url);
      watchedState.feeds.push(newFeed);
      watchedState.posts.push(...newPosts);
      return response.data.contents;
    })
    .catch((e) => {
      const [error] = e.errors;
      showError(error);
    });
};

const renderFeeds = (value) =>
  value
    .map(
      ({ title, description }) => `
        <li class="list-group-item">
          <h3>${title}</h3>
          <p>${description}</p>
        </li>
      `
    )
    .join('');

const renderPosts = (value) =>
  value
    .map(
      ({ title, guid, link }) => `
        <li class="list-group-item d-flex justify-content-between align-items-start">
          <a
            class="font-weight-bold"
            href="${link}"
            data-id="${guid}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${title}
          </a>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            data-id="${guid}"
            data-toggle="modal"
            data-target="#modal"
          >
            Просмотр
          </button>
        </li>
      `
    )
    .join('');

const subscribe = () => {
  form.addEventListener('submit', onSubmit);
};

const initState = () => {
  state = {
    urls: [],
    feeds: [],
    posts: [],
  };
  watchedState = onChange(state, (path, value) => {
    if (path === 'feeds') {
      const html = `
        <h2>Фиды</h2>
        <ul class="list-group mb-5">
          ${renderFeeds(value)}
        </ul>
      `;
      feeds.innerHTML = html;
    }
    if (path === 'posts') {
      const html = `
        <h2>Посты</h2>
        <ul class="list-group">
          ${renderPosts(value)}
        </ul>
      `;
      posts.innerHTML = html;
    }
  });
};

const init = () => {
  initState();
  subscribe();
};

init();
