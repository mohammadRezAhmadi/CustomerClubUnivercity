import React from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Home.css'
function Home() {
  return (
    <Container>
        <Row className='align-items-center'>
            <Col xs={12} md={6} className='text-center'>
                <img src='./images/hapyy.png' alt='logo' />
            </Col>
            <Col xs={12} md={6} className='mt-n2'>
            <span className='text-danger'>باشگاه مشتریان ملی مهارت</span>
                <p className='text-black my-3 fs-1 sw-bold'>ثبت نام کن و از جشنواره های دانشگاه استفاده کن</p>
                <div className='d-flex justify-content-center gap-3'>
                    <Link to="/login" className='btn-login'>ثبت نام</Link>
                    <Link to="/sign" className='btn-sign'>ورود</Link>
                </div>
            </Col>
        </Row>
    </Container>
  )
}

export default Home
