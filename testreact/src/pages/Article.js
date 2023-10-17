import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';


const Article = () => {
  const { id } = useParams();
  return (
    <><div>
          <h2>게시글 {id}</h2>
      </div>
      <div>
              <Link to="/articles">목록으로 돌아가기</Link>
      </div>
    </>
  );
};

export default Article;