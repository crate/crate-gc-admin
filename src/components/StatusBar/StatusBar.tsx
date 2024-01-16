import logo from '../../assets/logo.png';

function StatusBar() {
  return (
    <div className="flex flex-row">
      <div>
        <a href="/">
          <img src={logo} alt="Crate logo" className="mx-auto h-5" />
        </a>
      </div>
    </div>
  );
}

export default StatusBar;
