import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import BookAppointment from '../components/BookAppointment'

const Home = () => {
  return (
    <div>
      <Header />
      <BookAppointment />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  )
}

export default Home
