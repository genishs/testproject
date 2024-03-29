import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import About from 'pages/About';
import Article from 'pages/Article';
import Articles from 'pages/Articles';
import Home from 'pages/Home';
import Profile from 'pages/Profile';
import NotFound from 'pages/NotFound';
import Login from 'pages/Login';
import MyPage from 'pages/MyPage';
import MapTest from 'pages/MapTest';

const App = () => {

  return (
      <><Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/profiles/:username" element={<Profile />} />
          <Route path="/articles" element={<Articles />}>
            <Route path=":id" element={<Article />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/maptest" element={<MapTest />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
      </>
  );
}

export default App;