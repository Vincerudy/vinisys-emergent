import React from 'react'
import { Link } from 'react-router-dom'
import { FiMoreVertical } from 'react-icons/fi'
import CardHeader from '@/components/shared/CardHeader'
import Pagination from '@/components/shared/Pagination'
import { userList } from '@/utils/fackData/userList'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'

const LatestLeads = ({title, alertes}) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    if (isRemoved) {
        return null;
    }

 
    function truncateText(text, limit = 16) {
        return text.length > limit ? text.slice(0, limit) + "..." : text;
    }

    return (
        <div className="col-xxl-8">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={title} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />

                <div className="card-body custom-card-action p-0" style={{height: '400px', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '10px' }}>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
 
                            <tbody>
                                {
                                       alertes.map(({ date_alerte, id, user_email, description, titre, jours_avant, color }) => (
                                        <tr key={id} className='chat-single-item'>
                                            <td>
                                   
                                                <span style={{ fontSize: '14px', padding: 10, borderRadius:7}} className={`  bg-soft-success text-success`}> Important</span>
                                            </td>
                                            
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    
                                                      
                                                         
                                                            
                                                 
                                                    <a href="#">
                                                        <span style={{ fontSize: '14px'}} className="d-block  text-primary">{titre}</span>
                                                    </a>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '14px'}} className="    text-dark">{truncateText(description)}</span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '14px', padding: 10, borderRadius:7}} className={`  bg-soft-primary text-primary`}> {date_alerte}</span>
                                                 
                                            </td>
 
 
                                      
                                        </tr>
                                    )
                                    )
                                
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
  
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default LatestLeads
