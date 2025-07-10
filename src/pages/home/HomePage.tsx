import TextField from '@/shared/components/textField/TextField';

const HomePage = () => {
  return (
    <div
      style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        backgroundColor: '#BDBDBD',
      }}
    >
      <TextField fieldSize="small" placeholder="YYYY" maxLength={4} />
      <TextField fieldSize="large" placeholder="이름을 입력해주세요." />
      <TextField fieldSize="thin" placeholder="ex) 솝트특별자치시 앱잼구" />
    </div>
  );
};

export default HomePage;
