import { createBrowserRouter, Navigate } from 'react-router-dom';
//guest
import Login from './views/login.jsx';
import Register from './views/register.jsx';
import GuestLayout from './Components/GuestLayout.jsx';
import DefaultLayout from './Components/DefaultLayout.jsx';
//admin
import Users from './views/admin/users.jsx';

import Adashboard from './views/admin/adminDashboard.jsx';
import Laboratories from './views/admin/laboratories.jsx';
import LaboratoryForm from './views/admin/LaboratoryForm.jsx';
import Labinfo from './views/admin/labinfo.jsx';
import Equipment from './views/admin/equipment.jsx';
import EquipmentForm from './views/admin/equipmentForm.jsx';
import Transaction from './views/admin/transaction.jsx';
import EquipmentInfo from './views/admin/equipmentInfo.jsx';
import ItemForm from './views/admin/ItemForm.jsx';
import EquipmentCategory from './views/admin/category.jsx';
//user
import UserLayout from './Components/UserLayout.jsx';
import Home from './views/Home.jsx';
import UserLab from './views/UserLab.jsx';

//*
import NotAuthorize from './views/NotAuthorized.jsx';
import NotFound from './views/NotFound.jsx'
import ProtectedRoute from './Components/ProtectedRoute.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedRoute allowedRoles={['user']}>
            <UserLayout />
            </ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'laboratories',
                element: <UserLab />,
            },
            
        ],
    },
    {
        path: '/NotAuthorized',
        element: <NotAuthorize />,
    },
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <DefaultLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Adashboard />,
            },
            {
                path: 'users',
                element: <Users />,
            },
           
            {
                path: 'lab',
                element: <Laboratories />,
            },
            {
                path: 'lab/new',
                element: <LaboratoryForm key="laboratoryCreate" />,
            },
            {
                path: 'lab/:id',
                element: <LaboratoryForm key="laboratoryUpdate" />,
            },
            {
                path: 'lab/:name/:id',
                element: <Labinfo key="infoUpdate" />,
            },
            {
                path: 'equipment',
                element: <Equipment/>,
            },
            {
                path: 'equipment/new',
                element: <EquipmentForm key="EquipmentCreate" />,
            },
            {
                path: 'equipment/:id',
                element: <EquipmentForm key="EquipmentUpdate" />,
            },
            {
                path: 'equipment/info/:id',
                element: <EquipmentInfo key="EquipmentInfo" />,
            },
            {
                path: 'equipment/info/:equipmentID/add-item',
                element: <ItemForm key="ItemCreate" />,
            },
            {
                path: 'equipment/info/:equipmentID/edit-item/:id',
                element: <ItemForm key="ItemUpdate" />,
            },
            {
                path: 'transactions',
                element: <Transaction/>,
            },
            {
                path: 'category',
                element: <EquipmentCategory/>,
            },
        ],
    },
    {
        path: '/auth',
        element: <GuestLayout />,
        children: [
            {
                index:true,
                element: <Login />,
            },
            {
                path: 'register',
                element: <Register />,
            },
        ],
    },
   
    {
        path: '*',
        element: <NotFound/>, // Redirect to login for unknown routes
    },
]);

export default router;