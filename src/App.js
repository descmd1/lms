import {  Routes, Route} from 'react-router-dom'
import { Aboutus } from './pages/Aboutus';
import { Landingpage } from './pages/Landingpage';
import { Profile } from './pages/Profile';
import { CreateCourse } from './pages/CreateCourse';
import { CourseDetails } from './pages/CourseDetails';
import { EditCourse } from './pages/EditCourse';
import { Home } from './pages/Home';
import { Contact } from './pages/Contact';
import { Layout } from './components/Layout';
import { useEffect } from 'react';
import axios from 'axios'
import { UpdateProfile } from './pages/UpdateProfile';
import { Resources } from './pages/Resources';
import { ViewResource } from './pages/ViewResource';
import { EnrolledCourses } from './pages/EnrolledCourses';
import { VerifyPayment } from './pages/VerifyPayment';
import { CompletedCourses } from './pages/CompletedCourses';
import { OngoingCourses } from './pages/OngoingCourses';
import { Analytics } from './pages/Analytics';
// import { Navbar } from './components/Navbar';


function App() {
 useEffect(() =>{
  let token = sessionStorage.getItem("user")
  if(token){
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }     
 }, [])
  return (
      <Routes>
        <Route path='/' element={<Landingpage/>}/>
        <Route element={<Layout/>}>
          <Route path='/home' element={<Home/>}/>
          <Route path='/about' element={<Aboutus/>}/>
          <Route path='/createcourse' element={<CreateCourse/>}/>
          <Route path='/coursedetails/:id' element={<CourseDetails/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='/editcourse/:id' element={<EditCourse/>}/>
          <Route path='/profileupdate/:id' element={<UpdateProfile/>}/>
          <Route path='/profileupdate/:id' element={<UpdateProfile/>}/>
          <Route path='/resources' element={<Resources/>}/>
          <Route path='/view-resources' element={<ViewResource/>}/>
          <Route path='/view-resources/:id' element={<ViewResource/>}/>
          <Route path="/verifypayment/:courseId" element={<VerifyPayment/>}/>
          <Route path='/enrolled' element={<EnrolledCourses/>}/>
          <Route path='/completed-courses' element={<CompletedCourses/>}/>
          <Route path='/ongoing-courses' element={<OngoingCourses/>}/>
          <Route path='/analytics' element={<Analytics/>}/>
        </Route>
      </Routes>
  );
}

export default App;
