import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import BookAppointment from '../components/BookAppointment'

const Home = () => {
  return (
    <div>
      <Header />
      <div className='px-4 md:px-10 lg:px-20 mt-8'>
        <BookAppointment />
        <SpecialityMenu />
        <TopDoctors />
        <Banner />
      </div>
    </div>
  )
}

export default Home
