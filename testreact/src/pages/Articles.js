import { NavLink, Link, Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

const Articles = () => {

    const isLoggedIn = false;

    if (!isLoggedIn) {
      return <Navigate to="/login" replace={true} />;
    }
  
  
  return (
    <>
        <div>
            <Outlet />
            <ul>
                <ArticleItem id={1} />
                <ArticleItem id={2} />
                <ArticleItem id={3} />
            </ul>
            </div>
            <div>
                <Link to="/">목록으로 돌아가기</Link>
        </div>
    </>
  );
};

const ArticleItem = ({ id }) => {
    const activeStyle = {
      color: 'green',
      fontSize: 21,
    };
    return (
      <li>
        <NavLink
          to={`/articles/${id}`}
          style={({ isActive }) => (isActive ? activeStyle : undefined)}
        >
          게시글 {id}
        </NavLink>
      </li>
    );
  };

export default Articles;