USE atendimento_db;

CREATE TABLE IF NOT EXISTS atendimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_emissao DATE NOT NULL,
    tipo_senha ENUM('SP', 'SG', 'SE') NOT NULL,
    sequencia_diaria INT NOT NULL,
    senha_formatada VARCHAR(20),
    hora_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
    hora_chamada DATETIME NULL,
    hora_finalizacao DATETIME NULL,
    guiche_id INT NULL,
    status ENUM('PENDENTE', 'CHAMADO', 'CONCLUIDO', 'CANCELADO') DEFAULT 'PENDENTE',
    
    INDEX idx_data (data_emissao),
    INDEX idx_tipo (tipo_senha),
    INDEX idx_status (status)
);

INSERT INTO atendimentos (data_emissao, tipo_senha, sequencia_diaria, senha_formatada, status)