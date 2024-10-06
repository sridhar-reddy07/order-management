import React from "react";
import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import NavigationBar from "./components/navigationBar";
import Sidenavigationbar from "./components/sidenavigationbar";
import Footer from "./components/footer";
import Entry from "./components/entry";
import AddOrder from "./components/addOrder";
import OrderList from "./components/orderList";

import Riz from "./components/riz";
import Karachi from "./components/karachi";
import Mussa from "./components/mussa";
import Embroidory from "./components/embroidory"
import Dtg from "./components/dtg";
import ScreenPrinting from "./components/screenPrinting";
import DtgEmd from "./components/dtgEmd";
import Instore from "./components/instore";
import Packing from "./components/packing";
import Completed from "./components/completed";
import Home from "./components/Home";
import Bob from "./components/bob";
import Invoice from "./components/invoice";
import SpEmd from "./components/spEmb";



function App() {
  const location = useLocation();
  const showSidebar = location.pathname !== '/';

  return (
    <div className="App">
      <NavigationBar />
      {showSidebar && <Sidenavigationbar />}
      <Routes>
        <Route path='/' element={<Entry />} />
        <Route path='/Home' element={<Home />} />
        <Route path='/addOrder' element={<AddOrder />} />
        <Route path='/orderList' element={<OrderList />} />
        <Route path='/riz' element={<Riz />} />
        <Route path='/karachi' element={<Karachi />} />
        
        <Route path = '/mussa' element = {<Mussa/>}/>
        <Route path= '/bob' element = {<Bob/>}/>
        <Route path = '/embroidory' element = {<Embroidory/>}/>
        <Route path= '/dtg' element = {< Dtg/>}/>
        <Route path= '/screenPrinting' element = {< ScreenPrinting/>}/>
        <Route path= '/dtgEmd' element = {<DtgEmd/>}/>
        <Route path= '/spEmd' element = {<SpEmd/>}/>
        <Route path = '/instore' element = {<Instore/>}/>
        <Route path = '/packing' element = {<Packing/>}/>
        <Route path = '/completed' element = {<Completed/>}/>
        <Route path = '/invoice' element = {<Invoice/>}/>
      </Routes>
      <Footer />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
