import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PostItem from './pages/PostItem';
import ListingDetail from './pages/ListingDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="post" element={<PostItem />} />
        <Route path="item/:id" element={<ListingDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
