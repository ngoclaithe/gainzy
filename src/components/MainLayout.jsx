import NavBar from './NavBar'
import InfoFooter from './InfoFooter'
import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <InfoFooter />
    </>
  );
}
