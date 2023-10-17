import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const data = {
  velopert: {
    name: '뚜또리',
    description: '리액트를 초보 개발자',
  },
  gildong: {
    name: '홍길동',
    description: '고전 소설 홍길동전의 주인공',
  },
};

const Profile = () => {
  const params = useParams();
  const profile = data[params.username];

  return (
    <><div>
      <h1>사용자 프로필</h1>
      {profile ? (
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.description}</p>
        </div>
      ) : (
        <p>존재하지 않는 프로필입니다.</p>
      )}
      <div>
        <Link to="/">홈으로 돌아가기</Link>
      </div>
    </div></>
  );
};

export default Profile;