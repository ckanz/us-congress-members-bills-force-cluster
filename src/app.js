import './style.css';
import { getMembers } from './api-functions';

getMembers(data => {
  console.log(data);
});
