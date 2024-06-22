import sqlite3

class Answer:
    def __init__(self, user : str, dataset: str, title: str, label: str) -> None:
        self.user = user
        self.dataset = dataset
        self.title = title
        self.label = label

class FixedAnswer:
    def __init__(self, dataset: str, title: str, label: str) -> None:
        self.dataset = dataset
        self.title = title
        self.label = label

class Database:
    def __init__(self):
        self.db_name = 'data.db'
        conn = sqlite3.connect(self.db_name)
        self.create_tables(conn)

    def create_tables(self, conn):
        cur = conn.cursor()
        cur.execute('''
                CREATE TABLE IF NOT EXISTS answers(
                            id INTEGER PRIMARY KEY,
                            user TEXT NOT NULL,
                            dataset TEXT NOT NULL,
                            title TEXT NOT NULL,
                            label TEXT,
                            UNIQUE(user, dataset, title)
                            );
            ''')
        cur.execute('''
                CREATE TABLE IF NOT EXISTS fixedAnswers(
                            id INTEGER PRIMARY KEY,                            
                            dataset TEXT NOT NULL,
                            title TEXT NOT NULL,
                            label TEXT,
                            UNIQUE(dataset, title)
                            );
                    ''')
        conn.commit()
        cur.close()        

    def insert_or_update_answer(self, answer : Answer):
        try:
            conn = sqlite3.connect(self.db_name)
            cur = conn.cursor()
            cur.execute('''
                INSERT OR REPLACE INTO answers (user, dataset, title, label) VALUES (?, ?, ?, ?)
            ''', (answer.user, answer.dataset, answer.title, answer.label))
            conn.commit()
            cur.close()
            conn.close()
        except sqlite3.IntegrityError as e:
            print(f"IntegrityError: {e}")
    
    def get_answers(self, user: str, dataset: str):
        conn = sqlite3.connect(self.db_name)
        cur = conn.cursor()
        cur.execute('''
            SELECT title, label FROM answers WHERE dataset = ? AND user = ?
        ''', (dataset, user))        
        res = cur.fetchall()
        cur.close()
        conn.close()
        return res

    def insert_or_update_fixed_answer(self, answer: FixedAnswer ) :
        try:
            conn = sqlite3.connect(self.db_name)
            cur = conn.cursor()
            cur.execute('''
                INSERT OR REPLACE INTO fixedAnswers (dataset, title, label) VALUES (?, ?, ?)
            ''', (answer.dataset, answer.title, answer.label))
            conn.commit()
            cur.close()
            conn.close()
        except sqlite3.IntegrityError as e:
            print(f"IntegrityError: {e}")
        
    def get_fixed_answer(self, dataset: str, title: str) -> str | None:
        conn = sqlite3.connect(self.db_name)
        cur = conn.cursor()
        cur.execute('''
            SELECT label FROM fixedAnswers WHERE dataset = ? AND title = ?
        ''', (dataset, title))
        res = cur.fetchall()
        cur.close()
        conn.close()
        if res.__len__() > 0:
            return res[0][0]
        else:
            return None
    def get_fixes(self, dataset: str):
        conn = sqlite3.connect(self.db_name)
        cur = conn.cursor()
        cur.execute('''
            SELECT title, label FROM fixedAnswers WHERE dataset = ?;
        ''', (dataset,))
        result = []
        res = cur.fetchall()
        for title, label in res :
            result.append({
                'title' : title,
                'label' : label,
            })
        cur.close()
        conn.close()
        return result