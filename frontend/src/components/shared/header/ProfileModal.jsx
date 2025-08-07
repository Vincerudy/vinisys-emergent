import React, { Fragment } from 'react'
import { FiActivity, FiBell, FiChevronRight, FiDollarSign, FiLogOut, FiSettings, FiUser } from "react-icons/fi"
import { useAuth } from '../../../contexte/AuthContext';
import userPhoto from '../../../assets/icon_user.png'

const activePosition = ["Active", "Always", "Bussy", "Inactive", "Disabled", "Cutomization"]
const subscriptionsList = ["Plan", "Billings", "Referrals", "Payments", "Statements", "Subscriptions"]
const ProfileModal = ({userData}) => {

    const { logout, id, permissions, urlPhoto  } = useAuth();

    const url = '/#/societe/roles/user/' + id 
    return (
        <div className="dropdown nxl-h-item">
     
            <a href="#" data-bs-toggle="dropdown" role="button" data-bs-auto-close="outside">
                {urlPhoto === null || !urlPhoto ?

                    <img src={userPhoto} alt="user-image" className="img-fluid user-avtar me-0" />
                    :
                    <img src={`${import.meta.env.VITE_API_URL}`+ urlPhoto} alt="user-image" className="img-fluid user-avtar me-0" />
                 }

            </a>
            <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-user-dropdown">
                <div className="dropdown-header">
                    <div className="d-flex align-items-center">
                    {urlPhoto === null || !urlPhoto ?

                    <img src={userPhoto} alt="user-image" className="img-fluid user-avtar me-0" />
                    :
                    <img src={`${import.meta.env.VITE_API_URL}`+ urlPhoto} alt="user-image" className="img-fluid user-avtar me-0" />
                    }
                        <div>
                            <h6 className="text-dark mb-0">{userData.firstName} {userData.lastName} </h6>
 
                        </div>
                    </div>
                </div>
                <div className="dropdown">
 
                    <div className="dropdown-menu user-active">
                        {
                            activePosition.map((item, index) => {
                                return (
                                    <Fragment key={index}>
                                        {index === activePosition.length - 1 && <div className="dropdown-divider"></div>}
                                        <a href="#" className="dropdown-item">
                                            <span className="hstack">
                                                <i className={`wd-10 ht-10 border border-2 border-gray-1 rounded-circle me-2 ${getColor(item)}`}></i>
                                                <span>{item}</span>
                                            </span>
                                        </a>
                                    </Fragment>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown">
 
                    <div className="dropdown-menu">
                        {
                            subscriptionsList.map((item, index) => {
                                return (
                                    <Fragment key={index}>
                                        {index === activePosition.length - 1 && <div className="dropdown-divider"></div>}
                                        <a href="#" className="dropdown-item">
                                            <span className="hstack">
                                                <i className="wd-5 ht-5 bg-gray-500 rounded-circle me-3"></i>
                                                <span>{item}</span>
                                            </span>
                                        </a>
                                    </Fragment>
                                )
                            })
                        }

                    </div>
                </div>
                <div className="dropdown-divider"></div>
                <a href={url} className="dropdown-item">
                    <i ><FiUser /></i>
                    <span>Gérer mon profil</span>
                </a>
        
 
                <div onClick={()=> logout()} className="dropdown-item">
                    <i> <FiLogOut /></i>
                    <span>Deconnexion</span>
                </div>
            </div>
        </div>
    )
}

export default ProfileModal

const getColor = (item) => {
    switch (item) {
        case "Always":
            return "always_clr"
        case "Bussy":
            return "bussy_clr"
        case "Inactive":
            return "inactive_clr"
        case "Disabled":
            return "disabled_clr"
        case "Cutomization":
            return "cutomization_clr"
        default:
            return "active-clr";
    }
}