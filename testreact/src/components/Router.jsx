import { BrowserRouter, Routes, Route } from "react-router-dom"

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Start />} />
    <nav>
      <NavLink to='/'>Start</NavLink>
      <Link to='/about'>About</Link>
      <Link to='/contact'>Contact</Link>
    </nav>
  </Routes>
</BrowserRouter>